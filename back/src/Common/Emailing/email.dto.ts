import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  message: string;
}
