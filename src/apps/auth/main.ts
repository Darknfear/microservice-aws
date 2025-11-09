import { startApp } from '@/libs/core/apps/boot';
import { AuthModule } from './auth.module';

startApp(AuthModule, { serviceName: 'Auth Service' }).then(() => {});
