import * as React from 'react';
import {
  Container,
  Head,
  Heading,
  Html,
  Text,
  Body,
  Section,
  Link,
} from '@react-email/components';

type MonthlyReminderEmailProps = {
  missingMonths: number;
  sheetUrl?: string;
};

export function MonthlyReminderEmailTemplate({
  missingMonths,
  sheetUrl = 'https://docs.google.com/spreadsheets/d/1pV0wIAdUzKZxRUxIH5fxZPFN_F7siAaqTW54PC7wEsI/edit?fbclid=IwY2xjawGK48dleHRuA2FlbQIxMQABHYldS18rDEOOjQFQ_My8Bcd8cRkTIciqPTvdlJTi8SLidZVuvRddyf6CRQ_aem_nyAFAPo6fMGM_7tdmmYhKw&gid=636234062#gid=636234062',
}: MonthlyReminderEmailProps) {
  const bankInfo = {
    bankName: 'MBBank',
    accountNumber: '4016092002',
    accountHolder: 'TRAN DUC MANH',
  };
  const currentMonth = new Date().getMonth() + 1;

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', padding: '24px' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <Heading
            style={{ fontSize: '20px', marginBottom: '12px', color: '#111827' }}
          >
            Thân gửi,
          </Heading>

          <Text style={{ marginBottom: '16px', color: '#374151' }}>
            Ban Nội Bộ gửi đến bạn lời nhắc: đã đến thời gian hoàn tất Tiền
            Tháng {currentMonth} và hiện tại hệ thống ghi nhận bạn còn lại{' '}
            <strong>{missingMonths}</strong> tháng chưa hoàn thành.
          </Text>

          <Text style={{ marginBottom: '16px', color: '#374151' }}>
            Để thuận tiện cho công tác quản lý và đảm bảo hoạt động của S-Group
            diễn ra suôn sẻ trong thời gian tới, rất mong bạn sắp xếp hoàn tất
            khoản nộp trong khoảng thời gian từ ngày{' '}
            <strong>
              01/{currentMonth} đến 10/{currentMonth}
            </strong>
            , bằng cách chuyển khoản:
          </Text>

          <Section
            style={{
              backgroundColor: '#f0f9ff',
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
              Ngân hàng: {bankInfo.bankName}
            </Text>
            <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
              Số tài khoản: {bankInfo.accountNumber}
            </Text>
            <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
              Chủ tài khoản: {bankInfo.accountHolder}
            </Text>
            <Text style={{ marginTop: '8px' }}>
              <strong>Nội dung:</strong> [Tên bạn] – nộp tiền tháng [...]
            </Text>
            <Text style={{ fontSize: '12px', color: '#6b7280' }}>
              Ví dụ: Đặng Ngọc Phú – nộp tiền tháng 10
            </Text>
          </Section>

          <Text style={{ marginBottom: '16px', color: '#374151' }}>
            Bạn có thể theo dõi chi tiết các khoản thu tại đường link:
            <Link href={sheetUrl} target="_blank" style={{ color: '#2563eb' }}>
              Quản lý tiền tháng S-Group
            </Link>
          </Text>

          <Text style={{ marginBottom: '16px', color: '#374151' }}>
            Việc nộp tiền tháng đúng hạn không đơn thuần là yêu cầu dành cho các
            thành viên hoạt động dưới 2 năm, mà còn là sự đóng góp thiết thực
            của bạn trong việc duy trì các hoạt động tổ chức, sinh hoạt và đào
            tạo của S-Group.
          </Text>

          <Text style={{ color: '#374151' }}>
            Ban Nội Bộ hy vọng bạn sẽ cố gắng sắp xếp để hoàn tất khoản nộp đúng
            hạn.
          </Text>
          <Text style={{ color: '#374151' }}>
            Cảm ơn sự đồng hành và tinh thần trách nhiệm của bạn tại S-Group!
          </Text>

          <Text
            style={{ marginTop: '24px', color: '#6b7280', fontSize: '14px' }}
          >
            Trân trọng, <br />
            Ban Nội Bộ – S-Group
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
