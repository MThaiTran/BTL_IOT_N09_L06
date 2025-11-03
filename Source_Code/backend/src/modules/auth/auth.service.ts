import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  async signInJwt(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.hashPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roleId: user.roleId,
    };

    const token = await this.jwtService.signAsync(payload);
    return { payload, token };
  }

  async signUp(signUpDto: SignupDto) {
    signUpDto.password = this.hashPassword(signUpDto.password);
    await this.usersService.create(signUpDto);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, firstName, lastName } = req.user;

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    // let random = new Date().getTime().toString();
    let random = 'password'; // Temporary password
    if (!user) {
      const newUser = {
        email,
        name: `${firstName} ${lastName}`,
        hashedPassword: this.hashPassword(random),
        roleId: 3,
      };
      user = await this.usersService.create(newUser);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roleId: user.roleId,
    };

    const token = await this.jwtService.signAsync(payload);
    return { payload, token };
  }
}
