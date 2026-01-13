import {ref} from "vue";
import type {UploadChangeParam, UploadProps} from "ant-design-vue";

export function useUpload(onOk: (fd: FormData, extra: string) => void) {
  const fileList = ref<UploadProps['fileList']>([])
  const uploading = ref<any>(false)

  const beforeUpload: UploadProps['beforeUpload'] = file => {
    fileList.value = [file];
    return false;
  };

  function onRemove() {
    fileList.value = []
  }

  const onUploadChange = (info: UploadChangeParam) => {
    uploading.value = info.file.status
  };

  function onSubmit(extra: string) {
    if (!fileList.value) return
    if (!fileList.value.length) return
    const fd = new FormData()
    fd.append('file', fileList.value[0] as any)
    onOk(fd, extra)
  }

  return {fileList, uploading, beforeUpload, onRemove, onUploadChange, onSubmit}
}
