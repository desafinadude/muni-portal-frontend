import { FullWidthGrid } from "../grid";

import { SimpleLinkBlock } from "../molecules/simple-link-block";
import { StatusMessage } from "../molecules/status-message";

export class ServiceRequestSubmitted {
  constructor() {
    const $allServiceRequests = new SimpleLinkBlock({
      href: "/service-requests/",
      title: "View all my service requests",
    }).render();

    const $submitAnotherRequest = new SimpleLinkBlock({
      href: "submit",
      title: "Submit another service request",
    }).render();

    this.$element = new FullWidthGrid([
      new StatusMessage({
        text: "Service request submitted",
        status: "success",
      }).render(),
      $allServiceRequests,
      $submitAnotherRequest,
    ]).render();
  }

  render() {
    return this.$element;
  }
}
