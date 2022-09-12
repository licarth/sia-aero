type Attributes = {
  _pk: string;
  _lk: string;
};
type Ad = Attributes & {
  Ctr?: Attributes;
  Territoire: Attributes;
  AdCode: Attributes;
  AdStatut: string;
  ArpLat: string;
  AdRefAltFt: string;
  ArpLong: string;
  AdNomComplet: string;
  AdNomCarto: string;
  AdMagVar: string;
};

export type Espace = Attributes & {
  Territoire: Attributes;
  TypeEspace: string;
  Nom: string;
  AdAssocie: Attributes;
};

export type Rwy = Attributes & {
  OrientationGeo: number;
  Longueur: number;
  Rwy: string;
  Principale?: "oui" | "non";
  Revetement: string;
};

export type Obstacle = Attributes & {
  Latitude: number;
  Longitude: number;
  TypeObst: string;
  Combien: number;
  AmslFt: number;
  AglFt: number;
  Geometrie: string;
};

export type Frequence = Attributes & {
  Ad: Attributes;
  Frequence: number;
  Remarque: string;
};

export type Service = Attributes & {
  Service: string;
  IndicService: string;
  Espace?: Attributes;
};

export type Partie = Attributes & {
  Espace: Attributes;
  NomPartie: string;
  NumeroPartie: number;
  Geometrie: string;
};

export type Volume = Attributes & {
  Partie: Attributes;
  PlafondRefUnite: string;
  Plafond: number;
  PlancherRefUnite: string;
  Plancher: number;
  Sequence: number;
  Classe: string;
  HorCode: string;
  HorTxt: string;
  Remarque: string;
};
export type NavFix = Attributes & {
  Latitude: number;
  Longitude: number;
  Geometrie: string;
  Territoire: Attributes;
  Description?: string;
  Ident?: string;
  NavType:
    | "VOR-DME"
    | "NDB"
    | "VOR"
    | "TACAN"
    | "DME-ATT"
    | "WPT"
    | "PNP"
    | "L"
    | "VFR";
};
export type RadioNav = Attributes & {
  NavFix: Attributes;
  Ad?: Attributes;
  NomPhraseo?: string;
  Station?: string;
  FlPorteeVert?: string;
  Frequence?: string;
  Situation?: string;
  AltitudeFt?: string;
  HorCode?: string;
  Usage?: string;
  Portee?: string;
  LatDme?: string;
  LongDme?: string;
  Remarque?: string;
  Geometrie?: string;
  Couverture?: string;
};

export type SiaExport = {
  _effDate: string;
  AdS: {
    Ad: Array<Ad>;
  };
  FrequenceS: {
    Frequence: Array<Frequence>;
  };
  ServiceS: {
    Service: Array<Service>;
  };
  EspaceS: {
    Espace: Array<Espace>;
  };
  RwyS: {
    Rwy: Array<Rwy>;
  };
  ObstacleS: {
    Obstacle: Array<Obstacle>;
  };
  PartieS: {
    Partie: Array<Partie>;
  };
  VolumeS: {
    Volume: Array<Volume>;
  };
  NavFixS: {
    NavFix: Array<NavFix>;
  };
  RadioNavS: {
    RadioNav: Array<RadioNav>;
  };
};
