import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  create(userId: string, dto: CreateExpenseDto) {
    // userId ko explicitly ObjectId me cast kar rahe hain - aggregate() pipelines
    // ke saath match karne ke liye consistent type zaroori hai
    return this.expenseModel.create({ ...dto, user: new Types.ObjectId(userId) });
  }

  findAll(userId: string, filters: { category?: string; from?: string; to?: string }) {
    const query: any = { user: new Types.ObjectId(userId) };

    if (filters.category) query.category = filters.category;
    if (filters.from || filters.to) {
      query.date = {};
      if (filters.from) query.date.$gte = new Date(filters.from);
      if (filters.to) query.date.$lte = new Date(filters.to);
    }

    return this.expenseModel.find(query).sort({ date: -1 });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.expenseModel.findOne({ _id: id, user: new Types.ObjectId(userId) });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.expenseModel.findOneAndUpdate(
      { _id: id, user: new Types.ObjectId(userId) },
      dto,
      { new: true },
    );
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async remove(userId: string, id: string) {
    const result = await this.expenseModel.findOneAndDelete({ _id: id, user: new Types.ObjectId(userId) });
    if (!result) throw new NotFoundException('Expense not found');
    return { message: 'Expense deleted successfully' };
  }

  // Kisi bhi specific month/year ka date range nikalta hai (1st se month-end tak)
  // month === 'current' -> aaj wala mahina
  // month + year diye ho -> wahi specific mahina (dropdown se selected)
  // kuch na do -> null (matlab all-time, koi filter nahi)
  private resolveDateRange(month?: string, year?: string) {
    const now = new Date();

    if (month === 'current') {
      const y = now.getFullYear();
      const m = now.getMonth(); // 0-indexed
      return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 0, 23, 59, 59, 999),
      };
    }

    if (month && year) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1; // frontend 1-12 bhejega, yahan 0-indexed karna hai
      return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 0, 23, 59, 59, 999),
      };
    }

    return null;
  }

  // Dashboard ke summary cards ke liye (total spend, transactions count)
  async getDashboardSummary(userId: string, month?: string, year?: string) {
    const match: any = { user: new Types.ObjectId(userId) };
    const range = this.resolveDateRange(month, year);
    if (range) match.date = { $gte: range.start, $lte: range.end };

    const result = await this.expenseModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { totalSpend: 0, totalTransactions: 0 };
  }

  // Reports screen ke "Category-wise Totals" table ke liye
  // month + year diye ho to dropdown se selected specific mahine ka data milega
  async getCategoryReport(userId: string, month?: string, year?: string) {
    const match: any = { user: new Types.ObjectId(userId) };
    const range = this.resolveDateRange(month, year);
    if (range) match.date = { $gte: range.start, $lte: range.end };

    return this.expenseModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }
}
