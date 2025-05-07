import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {animate, group, query, state, style, transition, trigger,} from '@angular/animations';
import {BidStatus} from '../../enums/status.enum';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-bid-status-list',
  standalone: true,
  imports: [CommonModule, IconField, InputIcon, InputText],
  template: `
    <div class="search-and-status">
      <div class="search-container">
        <div
          class="search-wrapper"
          [@searchAnimation]="searchFocused ? 'focused' : 'unfocused'"
        >
          <p-iconfield iconPosition="left">
            <p-inputicon
              styleClass="pi pi-search search-icon"
              [@searchIconAnimation]="searchFocused ? 'active' : 'inactive'"
            />
            <input
              type="text"
              pInputText
              placeholder="Search books..."
              class="search-input"
              (focus)="onSearchFocus()"
              (blur)="onSearchBlur()"
              (input)="onSearchInput($event)"
              [value]="searchTerm"
            />
          </p-iconfield>
        </div>
      </div>

      <nav class="status-nav">
        <ul class="status-list">
          <li
            *ngFor="let status of bidStatuses; let i = index"
            class="status-item"
            [class.active]="selectedStatus === status"
            (click)="onStatusSelect(status)"
            [@statusAnimation]="selectedStatus === status ? 'active' : 'inactive'"
            [@travelingHighlight]="{
              value: selectedStatus === status ? 'active' : 'inactive',
              params: { direction: getAnimationDirection(i) }
            }"
          >
            {{ status }}
          </li>
        </ul>
      </nav>
    </div>
  `,
  animations: [
    trigger('searchAnimation', [
      state(
        'unfocused',
        style({
          transform: 'scale(1)',
        })
      ),
      state(
        'focused',
        style({
          transform: 'scale(1.02)',
        })
      ),
      transition('unfocused <=> focused', [
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
    trigger('searchIconAnimation', [
      state(
        'inactive',
        style({
          transform: 'scale(1) rotate(0deg)',
          color: '#9ca3af',
        })
      ),
      state(
        'active',
        style({
          transform: 'scale(1.2) rotate(90deg)',
          color: '#50719c',
        })
      ),
      transition('inactive <=> active', [
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
    trigger('statusAnimation', [
      state(
        'inactive',
        style({
          transform: 'scale(1)',
          backgroundColor: '#f3f4f6',
          position: 'relative',
        })
      ),
      state(
        'active',
        style({
          transform: 'scale(1.05)',
          backgroundColor: '#50719c',
          position: 'relative',
        })
      ),
      transition('inactive => active', [
        animate(
          '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            transform: 'scale(1.05)',
            backgroundColor: '#50719c',
          })
        ),
      ]),
      transition('active => inactive', [
        animate(
          '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            transform: 'scale(1)',
            backgroundColor: '#f3f4f6',
          })
        ),
      ]),
    ]),
    trigger('travelingHighlight', [
      transition('* => *', [
        query(':enter, :leave', style({ position: 'absolute' }), {
          optional: true,
        }),
        group([
          query(
            ':enter',
            [
              style({
                transform: 'translateX({{ direction }}100%)',
                backgroundColor: '#50719c',
                opacity: 0,
              }),
              animate(
                '0.4s ease-out',
                style({
                  transform: 'translateX(0)',
                  opacity: 1,
                })
              ),
            ],
            { optional: true }
          ),
          query(
            ':leave',
            [
              style({
                transform: 'translateX(0)',
                backgroundColor: '#50719c',
                opacity: 1,
              }),
              animate(
                '0.4s ease-out',
                style({
                  transform: 'translateX({{ direction }}-100%)',
                  opacity: 0,
                })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
  styles: [
    `
      .search-and-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        margin-bottom: 40px;
        padding-top: 20px;
      }

      .search-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }

      .search-wrapper {
        position: relative;
        width: 400px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .search-input {
        width: 100%;
        padding: 12px 40px;
        border-radius: 25px;
        border: 1px solid #e0e0e0;
        font-size: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background-color: #f8f9fa;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .search-wrapper:hover .search-input {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .search-input:focus {
        border-color: #50719c;
        outline: none;
        box-shadow: 0 6px 20px rgba(80, 113, 156, 0.15);
      }


      .search-input:focus {
        color: #50719c;
      }

      .search-input::placeholder {
        color: #9ca3af;
        transition: opacity 0.3s ease;
      }

      .search-input:focus::placeholder {
        opacity: 0.7;
      }

      .status-nav {
        width: 100%;
      }

      .status-list {
        display: flex;
        gap: 20px;
        list-style: none;
        padding: 0;
        margin: 0;
        justify-content: center;
        flex-wrap: wrap;
      }

      .status-item {
        color: #384f6d;
        font-family: Poppins, sans-serif;
        font-size: 14px;
        cursor: pointer;
        padding: 8px 20px;
        border-radius: 20px;
        background-color: #f3f4f6;
        transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
        white-space: nowrap;
        position: relative;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        will-change: transform, background-color, box-shadow;
      }

      .status-item:hover {
        background-color: #e5e7eb;
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .status-item.active {
        background-color: #50719c;
        color: white;
        border-color: transparent;
        box-shadow: 0 6px 16px rgba(80, 113, 156, 0.25);
      }

      @media (max-width: 768px) {
        .search-wrapper {
          width: 90%;
          max-width: 400px;
        }

        .status-list {
          gap: 12px;
        }

        .status-item {
          padding: 6px 16px;
          font-size: 13px;
        }
      }

      @media (max-width: 480px) {
        .search-and-status {
          gap: 15px;
          padding-top: 70px;
        }

        .status-list {
          gap: 8px;
          margin-top: 5px;
        }

        .search-wrapper {
          width: 90%;
          max-width: 300px;
        }

        .search-input {
          font-size: 14px;
          padding: 10px 35px;
        }

        .status-item {
          padding: 5px 12px;
          font-size: 12px;
        }
      }
    `,
  ],
})
export class BidStatusListComponent implements OnInit {
  @Input() bidStatuses: BidStatus[] = [
    BidStatus.PENDING,
    BidStatus.ACCEPTED,
    BidStatus.REJECTED,
    BidStatus.ALL,
  ];
  @Input() selectedStatus: BidStatus | 'ALL' = 'ALL';
  @Output() statusSelected = new EventEmitter<BidStatus | 'ALL'>();
  @Output() searchChanged = new EventEmitter<string>();

  searchFocused = false;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private previousIndex = 0;

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.searchChanged.emit(searchTerm);
      });
  }

  onSearchFocus() {
    this.searchFocused = true;
  }

  onSearchBlur() {
    this.searchFocused = false;
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  getAnimationDirection(currentIndex: number): number {
    const direction = currentIndex > this.previousIndex ? 1 : -1;
    this.previousIndex = currentIndex;
    return direction;
  }

  onStatusSelect(status: BidStatus | 'ALL'): void {
    this.statusSelected.emit(status);
    this.selectedStatus = status;
  }
}
