export interface ArrivalStep {
  step: string;
  transport: string;
  cost_eur: number;
  duration_ru?: string;
  note_ru?: string;
}

export interface SimTariff {
  name: string;
  price_eur: number;
  data: string;
  extra_ru: string;
}

export interface AfterArrivalStep {
  id: string;
  title_ru: string;
  priority_ru?: string;
  recommended_operator?: string;
  why_ru?: string;
  tariffs_ru?: SimTariff[];
  activation_ru?: string;
  url?: string;
  alternatives_ru?: string;
  details_ru?: string[];
  tip_ru?: string;
}

export interface PermessoStep {
  step: number;
  title_ru: string;
  detail_ru: string;
  cost_eur?: number;
}

export interface RelocationHousingOption {
  name: string;
  price_min_eur?: number;
  price_max_eur?: number;
  pros_ru: string;
  url?: string;
}

export interface RelocationStep {
  title_ru: string;
  description_ru: string;
  details_ru?: string[];
  warning_ru?: string;
  link_to?: string;
  link_label?: string;
}

export interface RelocationSteps {
  title_ru: string;
  steps: RelocationStep[];
  disclaimer_ru: string;
}

export interface CardOption {
  name: string;
  tag_ru?: string;
  how_ru: string;
  details_ru?: string[];
  url?: string;
}

export interface CardsSection {
  title_ru: string;
  intro_ru: string;
  options: CardOption[];
  disclaimer_ru?: string;
}

export interface RelocationSeed {
  meta: {
    country_code: string;
    source: string;
    last_updated: string;
    data_policy: string;
  };
  intro_ru: {
    what_ru: string;
    key_ru: string;
  };
  steps_overview_ru: RelocationSteps;
  travel_routes: {
    title_ru: string;
    first_trip_logic_ru: string;
    airports_ru: string;
    flight_cost_ru: {
      estimate_ru: string;
      tip_ru: string;
    };
  };
  arrival_routes: {
    title_ru: string;
    via_bologna: { name_ru: string; steps_ru: ArrivalStep[] };
    via_milan: { name_ru: string; airports_ru: string; steps_ru: ArrivalStep[] };
    trenit_app_ru: string;
    route_to_home_ru: string;
  };
  after_arrival: {
    title_ru: string;
    first_shopping_ru: string;
    steps: AfterArrivalStep[];
  };
  cards_ru?: CardsSection;
  codice_fiscale: {
    title_ru: string;
    what_ru: string;
    if_not_in_russia_ru: string;
    where_ru: string;
    documents_ru: string[];
    steps_ru: string[];
    cost_ru: string;
  };
  permesso_di_soggiorno: {
    title_ru: string;
    deadline_ru: string;
    laura_help_ru: string;
    steps_ru: PermessoStep[];
    tracking_ru: string;
    tracking_url: string;
    documents_ru: string[];
  };
  housing_search: {
    title_ru: string;
    options: RelocationHousingOption[];
  };
}

// ── LOCI маршруты ─────────────────────────────────────────────────────────────

export interface RouteLeg {
  from: string;
  to: string;
  mode: string;
  note_ru?: string;
}

export interface LociRoute {
  id: string;
  name_ru: string;
  safe: boolean;
  requires_permit: boolean;
  warning_ru?: string;
  note_ru?: string;
  legs: RouteLeg[];
  cost_estimate_ru?: string;
}
