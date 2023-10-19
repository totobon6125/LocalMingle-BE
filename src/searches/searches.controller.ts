import { Controller } from '@nestjs/common';
import { SearchesService } from './searches.service';

@Controller('searches')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}
}
