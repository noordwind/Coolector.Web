import {inject} from 'aurelia-framework';
import UserService from 'resources/services/user-service';
import { ValidationControllerFactory,
  ValidationRules,
  validateTrigger  } from 'aurelia-validation';
import { MaterializeFormValidationRenderer } from 'aurelia-materialize-bridge';
import ToastService from 'resources/services/toast-service';
import LoaderService from 'resources/services/loader-service';
import {Router} from 'aurelia-router';

@inject(UserService, ToastService,
LoaderService, ValidationControllerFactory, Router)
export class ResetPassword {
  constructor(userService, toast, loader, controllerFactory, router) {
    this.userService = userService;
    this.toast = toast;
    this.loader = loader;
    this.controller = controllerFactory.createForCurrentScope();
    this.controller.validateTrigger = validateTrigger.blur;
    this.controller.addRenderer(new MaterializeFormValidationRenderer());
    this.router = router;
    this.sending = false;
    this.email = '';

    ValidationRules
      .ensure('email')
        .required()
          .withMessage('Email is required!')
        .email()
          .withMessage('Email is invalid!')
        .maxLength(100)
      .on(this);
  }

  async submit() {
    let errors = await this.controller.validate();
    if (errors.length > 0) {
      this.sending = false;

      return;
    }

    this.loader.display();
    this.sending = true;
    await this.userService.resetPassword(this.email);
    this.toast.info("If the provided email was correct, we've sent you a message with further instructions.");
    this.sending = false;
    this.loader.hide();
    this.router.navigateToRoute('sign-in');
  }
}
