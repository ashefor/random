import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { ManufacturerStaffGuard } from 'src/app/guards/manufacturer-staff.guard';
import { AdminGuard } from 'src/app/guards/admin.guard';
import { AdminManufacturerStaffGuard } from 'src/app/guards/admin-manufacturer-staff.guard';
import { ManagerSalesGuard } from 'src/app/guards/manager-sales.guard';
import { SalesGuard } from 'src/app/guards/sales.guard';
import { ManagerGuard } from 'src/app/guards/manager.guard';
import { AdminManagerSalesGuard } from 'src/app/guards/admin-manager-sales.guard';
import { AdminManagerGuard } from 'src/app/guards/admin-manager.guard';
import { AdminManufacturerStaffManagerGuard } from 'src/app/guards/admin-manufacturer-staff-manager.guard';
import { UserGuard } from 'src/app/guards/user.guard';


const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
      { path: '', redirectTo: '/main/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module')
          .then((m) => m.DashboardComponentModule), canActivate: [UserGuard]
      },
      {
        path: 'profile', loadChildren: () => import('../profile/profile.module')
          .then((m) => m.ProfileComponentModule), canActivate: [UserGuard]
      },
      {
        path: 'locations', loadChildren: () => import('../location/location.module')
          .then((m) => m.LocationComponentModule), canActivate: [AdminGuard]
      },
      {
        path: 'manufacturers', loadChildren: () => import('../manufacturer/manufacturer.module')
          .then((m) => m.ManufacturerComponentModule), canActivate: [AdminGuard]
      },
      {
        path: 'fees', loadChildren: () => import('../fee/fee.module').then((m) => m.FeeComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'manufacturer-staff', loadChildren: () => import('../manufacturer-party/manufacturer-party.module')
          .then((m) => m.ManufacturerPartyComponentModule), canActivate: [AdminGuard]
      },
      {
        path: 'channels', loadChildren: () => import('../store-type/store-type.module').then((m) => m.StoreTypeComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'areas', loadChildren: () => import('../area/area.module').then((m) => m.AreaComponentModule),
        canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'area-locations/:areaId',
        loadChildren: () => import('../location-area/location-area.module').then((m) => m.LocationAreaComponentModule),
        canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'account-managers', loadChildren: () => import('../manager/manager.module').then((m) => m.ManagerComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'buyers', loadChildren: () => import('../buyer/buyer.module').then((m) => m.BuyerComponentModule),
        canActivate: [AdminManagerGuard]
      },
      {
        path: 'distributors', loadChildren: () => import('../seller/seller.module').then((m) => m.SellerComponentModule),
        canActivate: [AdminManufacturerStaffManagerGuard]
      },
      {
        path: 'distributors/areas/:id', loadChildren: () => import('../seller-area/seller-area.module')
          .then((m) => m.SellerAreaComponentModule), canActivate: [AdminManufacturerStaffManagerGuard]
      },
      {
        path: 'sales-managers',
        loadChildren: () => import('../sales-manager/sales-manager.module').then((m) => m.SalesManagerComponentModule),
        canActivate: [AdminManagerGuard]
      },
      {
        path: 'sales-reps', loadChildren: () => import('../sales-rep/sales-rep.module').then((m) => m.SalesRepComponentModule),
        canActivate: [AdminManagerSalesGuard]
      },
      {
        path: 'tasks', loadChildren: () => import('../task/task.module').then((m) => m.TaskComponentModule),
        canActivate: [AdminManufacturerStaffGuard]
      },
      {
        path: 'promotions', loadChildren: () => import('../promotion/promotion.module').then((m) => m.PromotionComponentModule),
        canActivate: [AdminManufacturerStaffGuard]
      },
      {
        path: 'brands', loadChildren: () => import('../brand/brand.module').then((m) => m.BrandComponentModule),
        canActivate: [AdminManufacturerStaffGuard]
      },
      {
        path: 'earnings', loadChildren: () => import('../earning/earning.module').then((m) => m.EarningComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'referral-codes', loadChildren: () => import('../code/code.module').then((m) => m.CodeComponentModule),
        canActivate: [SalesGuard]
      },
      {
        path: 'referrals/:id', loadChildren: () => import('../referrals/referrals.module').then((m) => m.ReferralComponentModule),
        canActivate: [SalesGuard]
      },
      {
        path: 'stats/orders/:seller_name/:seller_id',
        loadChildren: () => import('../seller-orders/seller-orders.module').then((m) => m.SellerOrdersComponentModule),
        canActivate: [ManagerSalesGuard]
      },
      {
        path: 'stats/distributors',
        loadChildren: () => import('../manager-sellers/manager-sellers.module').then((m) => m.ManagerSellersComponentModule),
        canActivate: [ManagerGuard]
      },
      {
        path: 'stats/orders',
        loadChildren: () => import('../manufacturer-orders/manufacturer-orders.module')
          .then((m) => m.ManufacturerOrdersComponentModule), canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'features-flags', loadChildren: () => import('../feature/feature.module').then((m) => m.FeatureComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'brands/:manufacturerId', loadChildren: () => import('../brand/brand.module').then((m) => m.BrandComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'products/:brandId', loadChildren: () => import('../product/product.module').then((m) => m.ProductComponentModule),
        canActivate: [AdminManufacturerStaffGuard]
      },
      {
        path: 'task',
        loadChildren: () => import('../task-response/task-response.module').then((m) => m.TaskResponseComponentModule),
        canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'ledger', loadChildren: () => import('../ledger/ledger.module').then((m) => m.LedgerComponentModule),
        canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'surveys', loadChildren: () => import('../survey/survey.module').then((m) => m.SurveyComponentModule),
        canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'survey-responses/:surveyId',
        loadChildren: () => import('../survey-response/survey-response.module').then((m) => m.SurveyResponseComponentModule),
        canActivate: [ManufacturerStaffGuard]
      },
      {
        path: 'information', loadChildren: () => import('../feed/feed.module').then((m) => m.FeedComponentModule),
        canActivate: [AdminManufacturerStaffGuard]
      },
      {
        path: 'finances', loadChildren: () => import('../finances/finances.module').then((m) => m.FinancesComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'insights', loadChildren: () => import('../insights/insights.module').then((m) => m.InsightsComponentModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'notifications', loadChildren: () => import('../notifications/notifications.module')
          .then((m) => m.NotificationsComponentModule), canActivate: [AdminGuard]
      },
      {
        path: 'tickets',
         loadChildren: () => import('../tickets/tickets.module')
         .then((m) => m.TicketsModule), canActivate: [AdminManagerGuard]
      },
      {
        path: 'orders',
         loadChildren: () => import('../orders/orders.module')
         .then((m) => m.OrdersModule), canActivate: [AdminManagerGuard]
      },
      {
        path: 'shopping-lists',
         loadChildren: () => import('../shopping-lists/shopping-lists.module')
         .then((m) => m.ShoppingListsModule), canActivate: [AdminManagerGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
