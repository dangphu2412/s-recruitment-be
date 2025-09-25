import { InternalFile } from '../../../../system/file/file.interceptor';

/**
 * Navigate here for the detail format
 *
 * n|	Họ và Tên |	Chuyên môn |	Thứ 2			   |  Thứ 3			      | ....            |    Chủ Nhật         |
 *  |           |            | Sáng	Chiều	Tối|	Sáng	Chiều	Tối	| Sáng	Chiều	Tối	| Sáng	Chiều	Tối	Sáng|
 */
export type FileActivityRequestRow = string[];

export class FileActivityRequestDTO {
  file: InternalFile;
}
