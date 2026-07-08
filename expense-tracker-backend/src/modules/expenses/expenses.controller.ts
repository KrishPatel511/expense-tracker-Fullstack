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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @ApiOperation({ summary: 'Create a new expense' })
  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Get all expenses (with optional filters)' })
  @ApiQuery({ name: 'category', required: false, enum: ['Food', 'Travel', 'Bills', 'Shopping'] })
  @ApiQuery({ name: 'from', required: false, example: '2026-06-01', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, example: '2026-06-30', description: 'End date (YYYY-MM-DD)' })
  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.findAll(user.userId, { category, from, to });
  }

  @ApiOperation({ summary: 'Dashboard summary — total spend & transaction count' })
  @ApiQuery({ name: 'month', required: false, example: 'current', description: '"current" or 1-12' })
  @ApiQuery({ name: 'year', required: false, example: '2026' })
  @Get('summary')
  getSummary(
    @CurrentUser() user: { userId: string },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.expensesService.getDashboardSummary(user.userId, month, year);
  }

  @ApiOperation({ summary: 'Category-wise totals for Reports page' })
  @ApiQuery({ name: 'month', required: false, example: '6', description: '1-12' })
  @ApiQuery({ name: 'year', required: false, example: '2026' })
  @Get('reports/category')
  getCategoryReport(
    @CurrentUser() user: { userId: string },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.expensesService.getCategoryReport(user.userId, month, year);
  }

  @ApiOperation({ summary: 'Get a single expense by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the expense' })
  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.expensesService.findOne(user.userId, id);
  }

  @ApiOperation({ summary: 'Update an expense by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the expense' })
  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(user.userId, id, dto);
  }

  @ApiOperation({ summary: 'Delete an expense by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the expense' })
  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.expensesService.remove(user.userId, id);
  }
}
