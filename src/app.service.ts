import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class AppService {
	private readonly file = './db.json';
	private readonly data = {};

	constructor() {
		this.data = JSON.parse(this.read());
	}

	private read(): string {
		if (!fs.existsSync(this.file)) {
			fs.writeFileSync(this.file, '{}');
		}
		return fs.readFileSync(this.file).toString();
	}

	private write() {
		fs.writeFileSync(this.file, JSON.stringify(this.data));
	}

	public setItem(name: string, value: any) {
		this.data[name] = value;
		this.write();
	}

	public getItem(name: string) {
		return this.data[name] || null;
	}

	public removeItem(name: string) {
		delete this.data[name];
		this.write();
	}
}
