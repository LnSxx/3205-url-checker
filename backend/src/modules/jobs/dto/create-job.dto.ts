import { ArrayMaxSize, ArrayMinSize, IsArray, IsUrl } from 'class-validator';

export class CreateJobDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { each: true },
  )
  urls!: string[];
}
