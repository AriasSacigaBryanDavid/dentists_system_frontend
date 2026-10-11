import { Component, Input } from '@angular/core';

@Component({
    selector: '[app-empty-table]',
    standalone: true,
    templateUrl: './empty-table.html',
    styleUrls: ['./empty-table.scss']
})
export class EmptyTableComponent {
    @Input() colspan: number = 5;
    @Input() message: string = 'No existen resultados';
    @Input() subtitle: string = 'Intenta ajustar tu búsqueda o limpiar los filtros.';
}