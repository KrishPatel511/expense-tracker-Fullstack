import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

// Poora module protected hai - bina JWT token ke koi bhi route access nahi hoga
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.findAll(user.userId, { category, from, to });
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: { userId: string },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.expensesService.getDashboardSummary(user.userId, month, year);
  }

  @Get('reports/category')
  getCategoryReport(
    @CurrentUser() user: { userId: string },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.expensesService.getCategoryReport(user.userId, month, year);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.expensesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.expensesService.remove(user.userId, id);
  }
}
