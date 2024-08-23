import {
	Body,
	Controller,
	Get,
	Inject,
	Logger,
	Param,
	Post,
	Sse,
} from '@nestjs/common';
import { AppService } from './app.service';
import ModbusRTU from 'modbus-serial';
import { interval, map, Observable } from 'rxjs';

@Controller()
export class AppController {
	private readonly logger = new Logger(AppController.name);

	constructor(
		private readonly appService: AppService,
		@Inject('MODBUS_RTU') private readonly modbus: ModbusRTU,
	) {
		modbus.connectRTUBuffered('/dev/ttyUSB0', { baudRate: 9600 }).catch((e) => {
			this.logger.warn(e);
		});
		modbus.setID(16);
	}

	@Post('/api/signal/title')
	async setSignalTitle(@Body() { index, value }) {
		const data = this.appService.getItem('titles') || [];
		data[index] = value;
		this.appService.setItem('titles', data);
		return data;
	}

	@Get('/api/signal/list')
	async getSignals() {
		const data = await this.modbus.readCoils(0, 17);
		const titles = this.appService.getItem('titles') || [];
		return data.data.map((val, index) => ({
			title: titles[index] || index,
			value: val,
		}));
	}

	@Post('/api/signal/:reg/:value')
	async setSignal(@Param() { reg, value }: any): Promise<number> {
		const addr = Number(reg);
		const val = Number(value);
		if (addr) {
			const response = await this.modbus.writeRegisters(addr, [val]);
			// reset register
			setTimeout(() => {
				this.modbus.writeRegisters(addr, [0]);
			}, 100);
			return response.length;
		}
		return -1;
	}

	@Sse('/api/signal/watch')
	sseWatchDigitalOutputs(): Observable<Promise<MessageEvent>> {
		return interval(3000).pipe(
			map(() => {
				return this.modbus
					.readCoils(0, 17)
					.then(({ data }) => ({ data } as MessageEvent));
			}),
		);
	}
}
