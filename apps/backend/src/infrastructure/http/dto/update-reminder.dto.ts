import { IsEmail, IsString, IsArray, IsNumber, IsBoolean, Min, Max, ArrayMinSize, IsOptional } from 'class-validator';

/**
 * DTO pour la mise à jour d'un rappel planifié (tous les champs sont optionnels)
 */
export class UpdateReminderDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  query?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  sources?: string[];

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  daysOfWeek?: number[];

  @IsNumber()
  @Min(0)
  @Max(23)
  @IsOptional()
  hour?: number;

  @IsNumber()
  @Min(0)
  @Max(59)
  @IsOptional()
  minute?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

