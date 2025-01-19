import { IsNotEmpty } from 'class-validator'

export class ActiveDto {
  @IsNotEmpty()
  id: string

  @IsNotEmpty()
  code: string
}
