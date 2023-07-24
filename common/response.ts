export const response = (code: number, data: any) => ({
  statusCode: code,
  body: JSON.stringify({ data }),
})
