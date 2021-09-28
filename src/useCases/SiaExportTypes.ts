type Attributes = {
  _pk: string;
  _lk: string;
};
type Ad = Attributes & {
  Ctr?: Attributes;
  Territoire: Attributes;
  AdCode: Attributes;
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
};
