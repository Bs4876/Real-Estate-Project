export class UserModel {
  userId: number = 0;
  fullName: string = '';
  email: string = '';
  password?: string;
  phone: string = '';
  address: string = '';
  isAdmin: boolean = false;
}

export class UserRegisterDTOModel {
    fullName: string = '';
    email: string = '';
    password: string = '';
    phone: string = '';
    address: string = '';
}

export class UserUpdateDTOModel {
    fullName?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
    phone?: string;
    address?: string;
}

export class UserLoginDTOModel {
    email: string = '';
    password: string = '';
}

export class UserProfileDTOModel {
    userId: number = 0;
    fullName: string = '';
    email: string = '';
    phone: string = '';
    address: string = '';
    isAdmin: boolean = false;
}