import {requestClient} from "#/api/request";
import {useAccessStore} from "@vben/stores";
import axios from "axios";
import {saveAs} from "file-saver";


export async function upload(data: FormData) {
  return requestClient.post('/common/file/upload', data, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
}

export async function downloadTemplate(fileName: string) {
  const accessStore = useAccessStore();
  axios({
    method: 'get',
    url: 'http://127.0.0.1:8099/common/download/template?fileName=' + fileName,
    responseType: 'blob',
    headers: {Authorization: `Bearer ${accessStore.accessToken}`}
  }).then(res => {
    const blob = new Blob([res.data]);
    saveAs(blob, decodeURIComponent(fileName) || 'template.xlsx');
  })
}

// 下载评估报告模板
export async function downloadEvaluationReport() {
  try {
    // 从public目录下载文件
    const response = await fetch('/Evaluation Report.docx');
    if (!response.ok) {
      throw new Error('文件下载失败');
    }
    
    const blob = await response.blob();
    saveAs(blob, '评估报告模板.docx');
  } catch (error) {
    console.error('下载评估报告模板失败:', error);
    throw error;
  }
}
