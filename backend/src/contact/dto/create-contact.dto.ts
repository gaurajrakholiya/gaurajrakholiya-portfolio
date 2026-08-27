import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateContactDto {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'name must be between 2 and 80 characters' })
  name!: string;

  @Transform(trim)
  @IsEmail({}, { message: 'email must be a valid address' })
  @MaxLength(254)
  email!: string;

  @Transform(trim)
  @IsString()
  @Length(10, 2000, { message: 'message must be between 10 and 2000 characters' })
  message!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  company?: string;

  /**
   * Honeypot. It is rendered off-screen and aria-hidden, so a human never sees
   * it and never fills it in. Anything non-empty here is a bot, and the request
   * is accepted with a 200 and then dropped — telling a bot it failed only
   * teaches it to try again differently.
   *
   * Declared on the DTO because `forbidNonWhitelisted` would otherwise 400 the
   * request before the service ever sees the field.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
