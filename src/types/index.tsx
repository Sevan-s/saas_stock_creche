export type Role = 'ADMIN_CRECHE' | 'DIRECTION' | 'EJE' | 'AP' | 'AGENT';

export type Section = 'Petits' | 'Moyens' | 'Grands' | 'Commune';

export type StatutCommande = 'BROUILLON' | 'VALIDEE' | 'EN_ATTENTE' | 'RECUE' | 'ANNULEE';

export interface Creche {
  _id: string;
  nom: string;
  codeRattachement: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  role: Role;
  sectionPrincipale?: Section;
  codePIN?: boolean;
  creche?: Creche;
  crecheId?: string;
}

export interface Category {
  _id: string;
  nom: string;
  couleur?: string;
  icone?: string;
  creche: string;
}

export interface Item {
  _id: string;
  creche: string;
  nom: string;
  categorie: Category | string;
  section: Section;
  quantite: number;
  quantiteActuelle: number;
  quantiteSouhaitee: number;
  seuilAlerte: number;
  unite: string;
  emplacement?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  _id: string;
  creche: string;
  utilisateur: {
    _id: string;
    nom: string;
    prenom: string;
    role: Role;
  };
  action: string;
  detail: string;
  item?: {
    _id: string;
    nom: string;
  };
  quantiteAjustee?: number;
  createdAt: string;
}

export interface OrderItem {
  item: Item;
  quantiteCommandee: number;
  quantiteRecue: number;
}

export interface Order {
  _id: string;
  creche: string;
  numeroCommande: string;
  creePar: {
    _id: string;
    nom: string;
    prenom: string;
  };
  statut: StatutCommande;
  items: OrderItem[];
  fournisseur?: string;
  remarques?: string;
  dateValidation?: string;
  dateReception?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}