import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from 'src/utils/decorators';
import { User, UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/utils';
import { Role } from 'src/utils/decorators/role.decorator';

// Grouping the endpoints in Swagger
@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /************************ CREATE ORDER *****************************/
  @ApiBearerAuth('bearer')
  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or bad request.',
  })
  public create(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(user.id, createOrderDto);
  }

  /************************ MARK ORDER AS COMPLETED*****************************/
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Role(UserRole.ADMIN)
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark an order as completed' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the order to mark as completed',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order successfully marked as completed.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins can mark orders as completed.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      "Order must be in 'PROCESSING' state to be marked as 'COMPLETED'.",
  })
  public async markAsCompleted(
    @CurrentUser() user: User,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.markOrderAsCompleted(user.id, orderId);
  }
}
