import {inject} from 'aurelia-framework';
import AuthService from 'resources/services/auth-service';
import UserService from 'resources/services/user-service';
import RemarkService from 'resources/services/remark-service';
import LocationService from 'resources/services/location-service';
import StatisticsService from 'resources/services/statistics-service';
import {Router} from 'aurelia-router';

@inject(AuthService, UserService, RemarkService,
LocationService, StatisticsService, Router)
export class Profile {
  constructor(authService, userService, remarkService,
  locationService, statisticsService, router) {
    this.authService = authService;
    this.userService = userService;
    this.remarkService = remarkService;
    this.location = locationService;
    this.statisticsService = statisticsService;
    this.router = router;
    this.sending = false;
    this.remarks = [];
    this.username = '';
    this.user = null;
    this.currentUser = null;
  }

  async activate(params) {
    if (params.user) {
      this.username = params.user;
    }
  }

  async attached() {
    await this.fetchUser();
    if (!this.user.name) {
      return;
    }
    await this.fetchStatistics();
    await this.fetchRemarks();
  }

  async fetchUser() {
    this.currentUser = await this.userService.getAccount();
    if (this.isCurrentUser) {
      this.user = this.currentUser;
    } else {
      this.user = await this.userService.getAccountByName(this.username);
    }
  }

  async fetchStatistics() {
    let statistics = await this.statisticsService.getUserStatistics(this.user.userId);
    if (statistics.name) {
      this.statistics = statistics;
    } else {
      this.statistics = {
        reportedCount: 0,
        resolvedCount: 0
      };
    }
  }

  async fetchRemarks() {
    let query = {
      authorId: this.user.userId,
      state: 'active',
      page: 1,
      results: 5
    };
    let remarks = await this.remarkService.browse(query);
    remarks.forEach(remark => {
      remark.url = this.router.generate('remark', { id: remark.id });
      remark.distance = this.location.calculateDistance({
        latitude: remark.location.coordinates[1],
        longitude: remark.location.coordinates[0]
      });
    }, this);
    this.remarks = remarks;
  }

  get isCurrentUser() {
    return !this.username || this.currentUser.name === this.username;
  }

  get isCoolectorAccount() {
    return this.authService.provider === 'coolector';
  }
}
