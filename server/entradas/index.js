// Módulo de entradas: se monta en un Express existente o se corre solo (src/server.js)
import { createModels } from './models/index.js';
import { createMp, createMockMp } from './services/mp.js';
import { createMailer } from './services/mailer.js';
import { createNotifier } from './services/notifier.js';
import { createService } from './services/entradas.js';
import { createRouter, defaultRequireAdmin } from './routes/index.js';

/**
 * Uso en el backend existente de Ico:
 *   const entradas = createEntradas({ config, mongoose, requireAdmin: authAdminExistente });
 *   app.use('/api/entradas', entradas.router);
 *   entradas.startJobs();
 */
export function createEntradas({ config, mongoose, requireAdmin, deps = {}, log = console }) {
  const models = createModels(mongoose);
  const mp = deps.mp || (config.isMock ? createMockMp(config) : createMp(config));
  const mailer = deps.mailer || createMailer(config);
  const notifier = deps.notifier || createNotifier({ config, mailer, log });
  const service = createService({ config, models, mp, mailer, notifier, log, now: deps.now });
  const router = createRouter({
    config,
    service,
    mp,
    requireAdmin: requireAdmin || defaultRequireAdmin(config),
  });

  let timer = null;
  function startJobs({ everyMs = 5 * 60 * 1000 } = {}) {
    if (timer) return;
    const tick = () => service.reconcile().catch((e) => log.error?.('[entradas] reconcile', e.message));
    timer = setInterval(tick, everyMs);
    timer.unref?.();
    setTimeout(tick, 15_000).unref?.();
  }
  function stopJobs() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { router, service, models, mp, mailer, notifier, startJobs, stopJobs };
}
