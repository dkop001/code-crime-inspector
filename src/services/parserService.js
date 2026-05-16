import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export const parseCode = (code) => {
  const findings = [];
  let ast;

  // 1. Syntax Error Detection
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true
    });
  } catch (err) {
    findings.push({
      type: 'SYNTAX_VIOLATION',
      severity: 'CRITICAL',
      line: err.loc?.line || 1,
      message: `Direct syntax violation: ${err.message}`,
      evidence: code.split('\n')[err.loc?.line - 1] || 'Unknown'
    });
    return findings; // Stop if syntax is broken
  }

  // 2. Rule Engine / AST Walking
  walk.ancestor(ast, {
    // Infinite Loop Detection
    WhileStatement(node) {
      if (node.test.type === 'Literal' && node.test.value === true) {
        findings.push({
          type: 'INFINITE_LOOP_HAZARD',
          severity: 'HIGH',
          line: node.loc.start.line,
          message: 'A perpetual loop was detected. This execution will never conclude.',
          evidence: 'while (true) { ... }'
        });
      }
    },

    // Null Access Risks (Basic check for property access on suspected names)
    MemberExpression(node) {
      if (node.object.type === 'Identifier' && (node.object.name === 'data' || node.object.name === 'item')) {
        findings.push({
          type: 'NULL_POINTER_RISK',
          severity: 'MEDIUM',
          line: node.loc.start.line,
          message: `Unchecked property access on '${node.object.name}'. Potential null reference.`,
          evidence: code.split('\n')[node.loc.start.line - 1].trim()
        });
      }
    },

    // Off-by-one Detection (Check for <= array.length)
    BinaryExpression(node) {
      if (node.operator === '<=') {
        const isLength = (n) => 
          n.type === 'MemberExpression' && 
          n.property.type === 'Identifier' && 
          n.property.name === 'length';
          
        if (isLength(node.right)) {
          findings.push({
            type: 'OFF_BY_ONE_ERROR',
            severity: 'MEDIUM',
            line: node.loc.start.line,
            message: 'Suspicious loop condition. Iterating up to length (inclusive) often causes overflow.',
            evidence: code.split('\n')[node.loc.start.line - 1].trim()
          });
        }
      }
    },

    // Async Mistakes
    FunctionDeclaration(node) {
      if (!node.async) {
        let hasAwait = false;
        walk.simple(node, {
          AwaitExpression() { hasAwait = true; }
        });
        if (hasAwait) {
          findings.push({
            type: 'ASYNC_MISMANAGEMENT',
            severity: 'HIGH',
            line: node.loc.start.line,
            message: 'Illegal use of await in a non-async function declaration.',
            evidence: `function ${node.id.name} (...) { await ... }`
          });
        }
      }
    }
  });

  return findings;
};
