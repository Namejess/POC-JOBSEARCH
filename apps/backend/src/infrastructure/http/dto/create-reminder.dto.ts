import { IsEmail, IsString, IsArray, IsNumber, IsBoolean, Min, Max, ArrayMinSize } from 'class-validator';

/**
 * DTO pour la création d'un rappel planifié
 */
export class CreateReminderDto {
  @IsEmail()
  email!: string;

  @IsString()
  query!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  sources!: string[];

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  daysOfWeek!: number[]; // 0-6 (Dimanche à Samedi)

  @IsNumber()
  @Min(0)
  @Max(23)
  hour!: number;

  @IsNumber()
  @Min(0)
  @Max(59)
  minute!: number;

  @IsBoolean()
  active!: boolean;
}

