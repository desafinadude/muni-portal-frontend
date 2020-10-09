import {tryRegisterSW} from './swRegistration.js';
import {ServicesTab, TabContentContainer} from './components/tabs.js';
import {ModalPage, Service} from './components/pages.js';

// Call as early as possible to maximise chance of registering reinstallation code
tryRegisterSW();

const settings = {
  defaultBaseUrl: "https://muni-portal-backend.openup.org.za"
};

class App {
  constructor() {
    const tabContentContainer = new TabContentContainer($(".tab-content"));
    this.servicesTab = new ServicesTab(settings, $(".main .tab-link").first(), tabContentContainer);
    this.modalPage = new ModalPage($(".main .page__wrap"));
    this.router = new Router([
      { path: /^\/?$/, view: this.viewRedirect("/services/") },
      { path: new RegExp('^/services/$'), view: this.viewServices.bind(this) },
      { path: /^\/services\/(?<serviceSlug>[\w-]+)\/$/, view: this.viewService.bind(this) },
      { path: new RegExp('.*'), view: function() { $('body').text('Not found!'); }},
    ]);
    this.router.route();
  }

  setTitle(title) {
    $("title").text(title);
  }

  viewRedirect(location) {
    window.history.pushState({}, "", location);
  }

  viewServices() {
    this.modalPage.hide();
    this.servicesTab.show();
    this.setTitle("Services");
  }

  viewService(params){
    this.modalPage.show();

    const searchParams = new URLSearchParams([
      ["type", "core.ServicePage"],
      ["fields", "*"],
      ["slug", params.serviceSlug]
    ]);
    const serviceUrl = `${self.settings.defaultBaseUrl}/api/wagtail/v2/pages/?${searchParams.toString()}`;
    $.get(serviceUrl)
      .done(((response) => {
        console.assert(response.meta.total_count == 1);
        const service = new Service(response.items[0]);
        this.setTitle(response.items[0].title);
        this.modalPage.setContent(service.render());
      }).bind(this))
      .fail(function(a, b) {
        console.error(a, b);
      });
  }
}

class Router {
  constructor(routes) {
    this.routes = routes;
    const router = this;
    $("body").on('click', 'a[href^="/"]', function(e) {
      e.preventDefault();
      window.history.pushState({}, "", $(this).attr("href"));
      router.route();
    });

    window.addEventListener("popstate", this.route.bind(this));
  }

  parseLocation() { return window.location.pathname; }

  route(e) {
    const location = this.parseLocation();
    for (const route of this.routes) {
      const match = route.path.exec(location);
      if (match) {
        console.debug(location, "matched", route);
        route.view(match.groups);
        return;
      }
    }

    console.error("No match for ", location);
  }
}
const app = new App();
