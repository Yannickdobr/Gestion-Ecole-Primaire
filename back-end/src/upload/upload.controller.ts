import {
  Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Extensions autorisées (images + documents)
const AUTORISEES = /\.(png|jpe?g|gif|webp|pdf|docx?|xlsx?|txt)$/i;

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  @Post()
  @ApiOperation({ summary: 'Téléverser un fichier (photo élève, document d\'épreuve…)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-40);
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safe}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
      fileFilter: (_req, file, cb) => {
        if (!AUTORISEES.test(extname(file.originalname))) {
          return cb(new BadRequestException('Type de fichier non autorisé'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Aucun fichier reçu (champ "file").');
    // URL relative servie en statique sous /uploads (hors préfixe /api)
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mime: file.mimetype,
    };
  }
}
