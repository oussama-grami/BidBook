/*
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'http://localhost:3000/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { displayName, username, photos, emails } = profile;
    const [firstName, lastName] = displayName
      ? displayName.split(' ')
      : [username, ''];

    const user = {
      email: emails && emails[0] ? emails[0].value : `${username}@github.com`,
      firstName: firstName || username,
      lastName: lastName || '',
      picture: photos && photos[0] ? photos[0].value : null,
      githubId: profile.id,
      accessToken,
    };

    done(null, user);
  }
}
*/
