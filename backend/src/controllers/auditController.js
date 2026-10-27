const { auditLogs } = require('../services/mockPlsqlEngine');

const auditController = {
  async list(req, res, next) {
    try {
      const { tableName, actionType, entityId, limit } = req.query;

      let logs = [...auditLogs];

      if (tableName) {
        logs = logs.filter(l => l.table_name.toUpperCase() === tableName.toUpperCase());
      }
      if (actionType) {
        logs = logs.filter(l => l.action_type.toUpperCase() === actionType.toUpperCase());
      }
      if (entityId) {
        logs = logs.filter(l => l.entity_id.includes(entityId));
      }

      const parsedLimit = limit ? Number(limit) : 100;
      logs = logs.slice(0, parsedLimit);

      res.json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = auditController;
