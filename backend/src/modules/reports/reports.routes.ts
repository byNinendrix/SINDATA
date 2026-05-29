import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import {
  getReportMetadataController,
  getReportMetadataFilterOperatorsController,
  getReportMetadataRelationsController,
  getReportMetadataTableFieldsController,
  getReportMetadataTablesController
} from './report-metadata.controller';
import {
  createReportModelController,
  deleteReportModelController,
  duplicateReportModelController,
  getReportModelByIdController,
  listReportModelsController,
  updateReportModelController
} from './report-model.controller';
import { previewReportController } from './report-preview.controller';

export async function reportsRoutes(app: FastifyInstance) {
  app.get('/metadata', { preHandler: authMiddleware }, getReportMetadataController);
  app.get('/metadata/tables', { preHandler: authMiddleware }, getReportMetadataTablesController);
  app.get('/metadata/tables/:id/fields', { preHandler: authMiddleware }, getReportMetadataTableFieldsController);
  app.get('/metadata/relations', { preHandler: authMiddleware }, getReportMetadataRelationsController);
  app.get('/metadata/filter-operators', { preHandler: authMiddleware }, getReportMetadataFilterOperatorsController);

  app.get('/models', { preHandler: authMiddleware }, listReportModelsController);
  app.get('/models/:id', { preHandler: authMiddleware }, getReportModelByIdController);
  app.post('/models', { preHandler: authMiddleware }, createReportModelController);
  app.put('/models/:id', { preHandler: authMiddleware }, updateReportModelController);
  app.delete('/models/:id', { preHandler: authMiddleware }, deleteReportModelController);
  app.post('/models/:id/duplicate', { preHandler: authMiddleware }, duplicateReportModelController);

  app.post('/preview', { preHandler: authMiddleware }, previewReportController);
}
