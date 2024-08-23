import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: 'MODBUS_RTU',
			useFactory: async () => {
				const { default: ModbusRTU } = await import('modbus-serial');
				return new ModbusRTU();
			},
		},
	],
})
export class AppModule {}
