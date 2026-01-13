// import type { EventHandlerRequest, H3Event } from 'h3';

// // 接收性能准确度数据上传（算法类型 + 数据类型 + 文件）
// export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
//   const form = await readMultipartFormData(event);
//   if (!form) {
//     return useResponseError(-1, '未收到表单数据', 'multipart/form-data required');
//   }

//   const getField = (name: string) =>
//     form.find((item) => item.name === name)?.data?.toString('utf-8') ?? '';

//   const algorithmType = getField('algorithmType');
//   const dataType = getField('dataType');
//   const fileItem = form.find((item) => item.name === 'file');

//   if (!algorithmType || dataType === '') {
//     return useResponseError(-1, '参数缺失', 'algorithmType 与 dataType 必填');
//   }
//   if (!fileItem) {
//     return useResponseError(-1, '文件缺失', 'file 必填');
//   }

//   const mockPath = `/mock/uploads/${Date.now()}-${fileItem.filename}`;

//   return useResponseSuccess({
//     algorithmType,
//     dataType: Number(dataType),
//     fileName: fileItem.filename,
//     size: fileItem.data?.length ?? 0,
//     path: mockPath,
//     url: mockPath,
//   });
// });


