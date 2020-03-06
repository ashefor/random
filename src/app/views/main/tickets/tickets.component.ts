import { Component, OnInit } from '@angular/core';
import { TicketsService } from 'src/app/services/tickets.service';
import { CacheService } from 'src/app/services/cache.service';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  filterOptions: string[] = ['cancelled', 'completed', 'draft', 'in-progress', 'pending'];
  title: String;
  allTickets: Array<any>;
  sorted: Array<any>;
  currentPage = 1;
  itemsPerPage = 9;
  constructor(private tickets: TicketsService, private cache: CacheService, title: Title,
    private toastr: ToastrService) {
    this.title = 'Tickets';
    title.setTitle('Suplias - Tickets');
  }

  ngOnInit() {
    this.cache.allTickets.subscribe(value => {
      if (value) {
        this.allTickets = value;
        this.sorted = value;
      }
    });
    this.fetchAllTickets();
  }

  fetchAllTickets() {
    this.tickets.readAllTickets()
      .catch((error: any) => {
        this.toastr.error(error.message);
      });
  }

  itemIndex(indexOnPage: number): number {
    return (this.itemsPerPage * (this.currentPage - 1)) + indexOnPage;
  }

  changeTicketStatusColor(ticket_status) {
    switch (ticket_status) {
      case 'draft':
        return 'draft_color';
      case 'cancelled':
        return 'cancelled_color';
      case 'completed':
        return 'completed_color';
      case 'pending':
        return 'pending_color';
      default:
        return 'in_progress_color';
    }
  }

  filterTable(e) {
    const order_status = e.target.value;
    this.sorted = this.allTickets.filter(item => item.status === order_status);
  }
}
