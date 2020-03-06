import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Stats } from '../views/main/manufacturer-orders/manufacturer-orders.component';
import { Stats as SellerOrderStats } from '../views/main/seller-orders/seller-orders.component';
import { SellerStats } from '../views/main/manager-sellers/manager-sellers.component';
import { Ledger } from '../views/main/ledger/ledger.component';

export interface AccountManagerLineChartData {
  seller: any;
  lineChartData: LineChartData[];
}

export interface LineChartData {
  insight: any;
  title: string;
  previous: number;
  current: number;
  change: number;
  data: Array<{ data: Array<any>, label: string }>;
  labels: Array<string>;
  colors: Array<any>;
  deltaMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  public areas = new BehaviorSubject(null);
  public brands = new BehaviorSubject(null);
  public promotions = new BehaviorSubject(null);
  public tasks = new BehaviorSubject(null);
  public accountManagers = new BehaviorSubject(null);
  public manufacturerStaff = new BehaviorSubject(null);
  public salesManagers = new BehaviorSubject(null);
  public salesReps = new BehaviorSubject(null);
  public buyers = new BehaviorSubject(null);
  public singleSellers = new BehaviorSubject([]);
  public singleBuyers = new BehaviorSubject([]);
  public singleSalesOfficers = new BehaviorSubject([]);
  public allOrders = new BehaviorSubject(null);
  public orderItems = new BehaviorSubject([]);
  public shoppingItems = new BehaviorSubject([]);
  public allTickets = new BehaviorSubject(null);
  public shoppingLists = new BehaviorSubject(null);
  public manufacturers = new BehaviorSubject(null);
  public locations = new BehaviorSubject(null);
  public stores = new BehaviorSubject(null);
  public earnings = new BehaviorSubject(null);
  public fees = new BehaviorSubject(null);
  public insights = new BehaviorSubject(null);
  public distributors = new BehaviorSubject(null);
  public codes = new BehaviorSubject(null);
  public surveys = new BehaviorSubject(null);
  public features = new BehaviorSubject(null);
  public ledger: BehaviorSubject<Ledger> = new BehaviorSubject(null);
  public feed = new BehaviorSubject(null);
  public billings = new BehaviorSubject(null);
  public instructions = new BehaviorSubject(null);

  public buyer_lite = new BehaviorSubject(null);
  public manufacturer_lite = new BehaviorSubject(null);
  public seller_lite = new BehaviorSubject(null);

  //#region Manufacturer Stats
  public manufacturerOrderDay: BehaviorSubject<Stats> = new BehaviorSubject(null);
  public manufacturerOrderWeek: BehaviorSubject<Stats> = new BehaviorSubject(null);
  public manufacturerOrderMonth: BehaviorSubject<Stats> = new BehaviorSubject(null);
  public manufacturerOrderYear: BehaviorSubject<Stats> = new BehaviorSubject(null);
  //#endregion

  //#region Manager Stats
  public managerOrderDay: BehaviorSubject<Array<SellerStats>> = new BehaviorSubject(null);
  public managerOrderWeek: BehaviorSubject<Array<SellerStats>> = new BehaviorSubject(null);
  public managerOrderMonth: BehaviorSubject<Array<SellerStats>> = new BehaviorSubject(null);
  public managerOrderYear: BehaviorSubject<Array<SellerStats>> = new BehaviorSubject(null);
  //#endregion

  //#region Seller Stats
  public sellerOrderDay: BehaviorSubject<SellerOrderStats> = new BehaviorSubject(null);
  public sellerOrderWeek: BehaviorSubject<SellerOrderStats> = new BehaviorSubject(null);
  public sellerOrderMonth: BehaviorSubject<SellerOrderStats> = new BehaviorSubject(null);
  public sellerOrderYear: BehaviorSubject<SellerOrderStats> = new BehaviorSubject(null);
  public sellerCustomRange: BehaviorSubject<SellerOrderStats> = new BehaviorSubject(null);
  //#endregion

  //#region Dashboard
  public dash_manufacturers = new BehaviorSubject(0);
  public dash_brands = new BehaviorSubject(0);
  public dash_storeTypes = new BehaviorSubject(0);
  public dash_products = new BehaviorSubject(0);
  public dash_locations = new BehaviorSubject(0);
  public dash_areas = new BehaviorSubject(0);
  public dash_locationAreas = new BehaviorSubject(0);
  public dash_managers = new BehaviorSubject(0);
  public dash_manufacturerStaff = new BehaviorSubject(0);
  public dash_buyers = new BehaviorSubject(0);
  public dash_sellers = new BehaviorSubject(0);
  public dash_salesManagers = new BehaviorSubject(0);
  public dash_salesReps = new BehaviorSubject(0);
  public dash_promotions = new BehaviorSubject(0);
  public dash_tasks = new BehaviorSubject(0);
  public dash_earnings = new BehaviorSubject(0);
  public dash_codes = new BehaviorSubject(0);
  public dash_fees = new BehaviorSubject(0);
  public dash_surveys = new BehaviorSubject(0);
  public dash_information = new BehaviorSubject(0);
  //#endregion

  //#region Stats
  public stats: BehaviorSubject<Array<LineChartData>> = new BehaviorSubject(null);
  public accountManagerStats: BehaviorSubject<Array<AccountManagerLineChartData>> = new BehaviorSubject(null);
  //#endregion

  // task response title observable
  public taskResponseName: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor() { }

  setSurveys(surveys: Array<any>) {
    this.surveys.next(surveys);
  }

  setAreas(areas: Array<any>) {
    this.areas.next(areas);
  }

  setBrands(brands: Array<any>) {
    this.brands.next(brands);
  }

  setPromotions(promotions: Array<any>) {
    this.promotions.next(promotions);
  }

  setTasks(tasks: Array<any>) {
    this.tasks.next(tasks);
  }

  setManufacturerStaff(staff: Array<any>) {
    this.manufacturerStaff.next(staff);
  }

  setAccountManagers(managers: Array<any>) {
    this.accountManagers.next(managers);
  }

  setSalesManagers(managers: Array<any>) {
    this.salesManagers.next(managers);
  }

  setSalesReps(reps: Array<any>) {
    this.salesManagers.next(reps);
  }

  setBuyers(buyers: Array<any>) {
    this.buyers.next(buyers);
  }
  saveSingleBuyer(singleBuyer: any) {
    const stale_data = this.singleBuyers.value;
    const indexIfExists = stale_data.findIndex(i => i._id === singleBuyer._id);
    if (indexIfExists !== -1) {
      stale_data.splice(indexIfExists, 1, singleBuyer);
    } else {
      stale_data.push(singleBuyer);
    }
    this.singleBuyers.next(stale_data);
  }
  saveSingleSeller(singleSeller: any) {
    const stale_data = this.singleSellers.value;
    const indexIfExists = stale_data.findIndex(i => i._id === singleSeller._id);
    if (indexIfExists !== -1) {
      stale_data.splice(indexIfExists, 1, singleSeller);
    } else {
      stale_data.push(singleSeller);
    }
    this.singleSellers.next(stale_data);
  }
  saveSingleSalesOfficer(salesOfficer: any) {
    const stale_data = this.singleSalesOfficers.value;
    const indexIfExists = stale_data.findIndex(i => i._id === salesOfficer._id);
    if (indexIfExists !== -1) {
      stale_data.splice(indexIfExists, 1, salesOfficer);
    } else {
      stale_data.push(salesOfficer);
    }
    this.singleSalesOfficers.next(stale_data);
  }
  saveOrderItems(order_items: any[]) {
    const stale_data = this.orderItems.value;
    order_items.map(s => {
      const indexIfExists = stale_data.findIndex(i => i._id === s._id);
      if (indexIfExists !== -1) {
        stale_data.splice(indexIfExists, 1, s);
      } else {
        stale_data.push(s);
      }
    });
    this.orderItems.next(stale_data);
  }

  saveShoppingItems(shopping_items: any[]) {
    const stale_data = this.shoppingItems.value;
    shopping_items.map(s => {
      const indexIfExists = stale_data.findIndex(i => i._id === s._id);
      if (indexIfExists !== -1) {
        stale_data.splice(indexIfExists, 1, s);
      } else {
        stale_data.push(s);
      }
    });
    this.shoppingItems.next(stale_data);
  }

  setAllOrders(orders: Array<any>) {
    this.allOrders.next(orders);
  }
  setAllTickets(tickets: Array<any>) {
    this.allTickets.next(tickets);
  }
  setShoppingList(list: Array<any>) {
    this.shoppingLists.next(list);
  }
  setManufacturers(manufacturers: Array<any>) {
    this.manufacturers.next(manufacturers);
  }

  setLocations(locations: Array<any>) {
    this.locations.next(locations);
  }

  setStores(stores: Array<any>) {
    this.stores.next(stores);
  }

  setEarnings(earnings: Array<any>) {
    this.earnings.next(earnings);
  }

  setFees(fees: Array<any>) {
    this.fees.next(fees);
  }

  setInsights(insights: Array<any>) {
    this.insights.next(insights);
  }

  setDistributors(distributors: Array<any>) {
    this.distributors.next(distributors);
  }

  setCodes(codes: Array<any>) {
    this.codes.next(codes);
  }

  setLedger(ledger: Ledger) {
    this.ledger.next(ledger);
  }

  setFeatures(features: Array<any>) {
    this.features.next(features);
  }

  setFeed(feed: Array<any>) {
    this.feed.next(feed);
  }

  //#region Manufacturer Stats
  setManufacturerDayStats(stats: Stats) {
    this.manufacturerOrderDay.next(stats);
  }

  setManufacturerWeekStats(stats: Stats) {
    this.manufacturerOrderWeek.next(stats);
  }

  setManufacturerMonthStats(stats: Stats) {
    this.manufacturerOrderMonth.next(stats);
  }

  setManufacturerYearStats(stats: Stats) {
    this.manufacturerOrderYear.next(stats);
  }
  //#endregion

  //#region Manufacturer Stats
  setManagerDayStats(stats: Array<SellerStats>) {
    this.managerOrderDay.next(stats);
  }

  setManagerWeekStats(stats: Array<SellerStats>) {
    this.managerOrderWeek.next(stats);
  }

  setManagerMonthStats(stats: Array<SellerStats>) {
    this.managerOrderMonth.next(stats);
  }

  setManagerYearStats(stats: Array<SellerStats>) {
    this.managerOrderYear.next(stats);
  }
  //#endregion

  //#region Seller Stats
  setSellerDayStats(stats: SellerOrderStats) {
    this.sellerOrderDay.next(stats);
  }

  setSellerWeekStats(stats: SellerOrderStats) {
    this.sellerOrderWeek.next(stats);
  }

  setSellerMonthStats(stats: SellerOrderStats) {
    this.sellerOrderMonth.next(stats);
  }

  setSellerYearStats(stats: SellerOrderStats) {
    this.sellerOrderYear.next(stats);
  }

  setSellerCustomRangeStats(stats: SellerOrderStats) {
    this.sellerCustomRange.next(stats);
  }
  //#endregion

}
