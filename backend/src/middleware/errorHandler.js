function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  const message = err.message || 'An unexpected database or server error occurred.';
  let statusCode = 500;
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Oracle PL/SQL Application Exception Mapping
  if (message.includes('ORA-20001')) {
    statusCode = 400;
    errorCode = 'INSUFFICIENT_FUNDS';
  } else if (message.includes('ORA-20002')) {
    statusCode = 403;
    errorCode = 'ACCOUNT_FROZEN';
  } else if (message.includes('ORA-20003')) {
    statusCode = 400;
    errorCode = 'INVALID_AMOUNT';
  } else if (message.includes('ORA-20004')) {
    statusCode = 404;
    errorCode = 'ACCOUNT_NOT_FOUND';
  } else if (message.includes('ORA-20005')) {
    statusCode = 400;
    errorCode = 'SAME_ACCOUNT_TRANSFER';
  } else if (message.includes('ORA-20006')) {
    statusCode = 404;
    errorCode = 'CUSTOMER_NOT_FOUND';
  } else if (message.includes('ORA-20010') || message.includes('ORA-20011') || message.includes('ORA-20012')) {
    statusCode = 400;
    errorCode = 'ACCOUNT_LIFECYCLE_RULE_VIOLATION';
  } else if (message.includes('ORA-20020')) {
    statusCode = 404;
    errorCode = 'LOAN_NOT_FOUND';
  } else if (message.includes('ORA-20021') || message.includes('ORA-20022') || message.includes('ORA-20023')) {
    statusCode = 400;
    errorCode = 'LOAN_RULE_VIOLATION';
  } else if (message.includes('ORA-00001')) {
    statusCode = 409;
    errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
  }

  // Strip Oracle prefix for clean user-facing presentation if needed, but preserve reference
  const cleanedMessage = message.replace(/^ORA-\d+:\s*/, '');

  res.status(statusCode).json({
    success: false,
    error: cleanedMessage,
    errorCode,
    rawError: process.env.NODE_ENV === 'development' ? message : undefined
  });
}

module.exports = errorHandler;
