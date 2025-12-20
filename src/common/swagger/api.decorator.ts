import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignupResponseDto } from '../../domain/auth/dto/response/signup.response.dto';
import { LoginResponseDto } from '../../domain/auth/dto/response/login.response.dto';
import { CreateRoomResponseDto } from '../../domain/chats/dto/response/create-room.response.dto';
import { GetMyRoomsResponseDto } from '../../domain/chats/dto/response/get-my-rooms.response.dto';
import { RoomDetailResponseDto } from '../../domain/chats/dto/response/room-detail.response.dto';
import { GetMessagesResponseDto } from '../../domain/chats/dto/response/get-messages.response.dto';
import { SendMessageResponseDto } from '../../domain/chats/dto/response/send-message.response.dto';
import { CreateRequestResponseDto } from '../../domain/requests/dto/response/create-request.response.dto';
import { FindAllRequestsResponseDto } from '../../domain/requests/dto/response/find-all-requests.response.dto';
import { FindOneRequestResponseDto } from '../../domain/requests/dto/response/find-one-request.response.dto';
import { CreateResponseResponseDto } from '../../domain/requests/dto/response/create-response.response.dto';
import { FindResponsesResponseDto } from '../../domain/requests/dto/response/find-responses.response.dto';
import { SelectHelperResponseDto } from '../../domain/requests/dto/response/select-helper.response.dto';
import { CompleteRequestResponseDto } from '../../domain/requests/dto/response/complete-request.response.dto';

// A more generic decorator can be created if more responses are needed.
export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );
}

export function ApiSignup() {
  return applyDecorators(
    ApiOperation({
      summary: 'User Signup',
      description: 'Registers a new user and provides an access token.',
    }),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully created.',
      type: SignupResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiResponse({ status: 409, description: 'Conflict. Email already exists.' }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'User Login',
      description: 'Logs in a user and provides a new access token.',
    }),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged in.',
      type: LoginResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized.' }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'User Logout',
      description: 'Logs out the user.',
    }),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged out.',
    }),
  );
}

export function ApiCreateOrFindRoom() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find or create a chat room',
      description: 'Finds an existing chat room or creates a new one.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully found a chat room.',
      type: CreateRoomResponseDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Successfully created a new chat room.',
      type: CreateRoomResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad Request.' }),
    ApiResponse({ status: 404, description: 'Not Found.' }),
  );
}

export function ApiGetMyRooms() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get my chat rooms',
      description: 'Retrieves a list of chat rooms for the current user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved chat rooms.',
      type: GetMyRoomsResponseDto,
    }),
  );
}

export function ApiGetRoomDetail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get chat room detail',
      description: 'Retrieves the details of a specific chat room.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved chat room details.',
      type: RoomDetailResponseDto,
    }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
    ApiResponse({ status: 404, description: 'Not Found.' }),
  );
}

export function ApiGetRoomMessages() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get chat room messages',
      description: 'Retrieves the messages from a specific chat room.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved messages.',
      type: GetMessagesResponseDto,
    }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
  );
}

export function ApiSendMessage() {
  return applyDecorators(
    ApiOperation({
      summary: 'Send a message',
      description: 'Sends a message to a specific chat room.',
    }),
    ApiResponse({
      status: 201,
      description: 'Successfully sent the message.',
      type: SendMessageResponseDto,
    }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
  );
}

export function ApiCreateRequest() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new request',
      description: 'Creates a new user request and broadcasts it to the map.',
    }),
    ApiResponse({
      status: 201,
      description: 'The request has been successfully created.',
      type: CreateRequestResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad Request (e.g., insufficient points).' }),
  );
}

export function ApiFindAllRequests() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find all requests',
      description: 'Retrieves a paginated list of requests, with optional filters.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved the list of requests.',
      type: FindAllRequestsResponseDto,
    }),
  );
}

export function ApiFindOneRequest() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find one request',
      description: 'Retrieves the details of a single request, including responses.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved the request details.',
      type: FindOneRequestResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Not Found.' }),
  );
}

export function ApiCancelRequest() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel a request',
      description: 'Cancels a request made by the user.',
    }),
    ApiResponse({ status: 200, description: 'The request has been successfully cancelled.' }),
    ApiResponse({ status: 400, description: 'Bad Request (e.g., already completed).' }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
  );
}

export function ApiCreateResponse() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a response to a request',
      description: 'Allows a user to bid on a request.',
    }),
    ApiResponse({
      status: 201,
      description: 'The response has been successfully created.',
      type: CreateResponseResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad Request (e.g., bidding on own request).' }),
  );
}

export function ApiFindResponses() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find all responses for a request',
      description: 'Retrieves all responses for a specific request.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved the list of responses.',
      type: FindResponsesResponseDto,
    }),
  );
}

export function ApiSelectHelper() {
  return applyDecorators(
    ApiOperation({
      summary: 'Select a helper',
      description: 'The requester selects a helper from the list of responses.',
    }),
    ApiResponse({
      status: 200,
      description: 'The helper has been successfully selected.',
      type: SelectHelperResponseDto,
    }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
  );
}

export function ApiCompleteRequest() {
  return applyDecorators(
    ApiOperation({
      summary: 'Complete a request',
      description: 'Marks the request as complete and transfers the points.',
    }),
    ApiResponse({
      status: 200,
      description: 'The request has been successfully completed.',
      type: CompleteRequestResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad Request (e.g., no helper selected).' }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
  );
}
