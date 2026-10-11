import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { FeatherIcon } from '@/app/shared/components/ui/feather-icon/feather-icon';

@Component({
    selector: 'app-custom-pagination',
    standalone: true,
    imports: [NgbPaginationModule],
template: `
        <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted small">
                {{ showingText }}
            </span>
            <nav aria-label="Page navigation">
                <ngb-pagination
                    class="pagination-secondary pagin-border-secondary"
                    size="sm"
                    [collectionSize]="collectionSize"
                    [page]="page"
                    [pageSize]="pageSize"
                    (pageChange)="onPageChange($event)"
                >
                    <ng-template ngbPaginationPrevious>
                        <span aria-hidden="true">&laquo;</span>
                        <span class="visually-hidden">Previous</span>
                    </ng-template>
                    <ng-template ngbPaginationNext>
                        <span aria-hidden="true">&raquo;</span>
                        <span class="visually-hidden">Next</span>
                    </ng-template>
                </ngb-pagination>
            </nav>
        </div>
    `
})
export class CustomPagination {
    @Input() showingRange: string | null = null;
    @Input() itemsName: string = 'registros';
    @Input() collectionSize!: number;
    @Input() page!: number;
    @Input() pageSize!: number;
    @Output() pageChange = new EventEmitter<number>();

    get showingText(): string {
        if (this.collectionSize === 0) {
            return `0 ${this.itemsName}`;
        }

        const start = (this.page - 1) * this.pageSize + 1;
        const end = Math.min(this.page * this.pageSize, this.collectionSize);

        return `${start} - ${end} de ${this.collectionSize} ${this.itemsName}`;
    }

    onPageChange(newPage: number) {
        if (this.page !== newPage) {
            this.page = newPage;
            this.pageChange.emit(newPage);
        }
    }

}
