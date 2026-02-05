
import { Injectable, inject } from '@angular/core';
import { EngineService } from '../engine.service';
import { MenuAction } from '../keyboard.service';
import { createMenuConfig } from '../../config/menu.config';

@Injectable({
    providedIn: 'root'
})
export class MenuManagerService {
    private engine = inject(EngineService);

    getMenuConfig(): MenuAction[] {
        return createMenuConfig(this.engine);
    }
}
