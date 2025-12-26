// app.use((_req, _res, next) => {
//   next(AppError.notFound());
// });

// app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
//   // Optional: catch Zod exceptions too (if any route uses parse() instead of safeParse())
//   if (err instanceof ZodError) {
//     const message = err.issues
//       .map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
//       .join('; ');
//     const appErr = AppError.badRequest(
//       `Validation error: ${message}`,
//       'VALIDATION_ERROR',
//     );
//     return sendError(res, appErr.message, appErr.statusCode, appErr.code);
//   }

//   if (err instanceof AppError) {
//     const message =
//       config.isProd && !err.expose ? 'Internal Server Error' : err.message;

//     // Log unexpected 5xx (but don’t spam logs for 4xx)
//     if (err.statusCode >= 500) console.error(err);

//     return sendError(res, message, err.statusCode, err.code);
//   }

//   console.error(err);
//   return sendError(res, 'Internal Server Error', 500, 'INTERNAL_SERVER_ERROR');
// });
