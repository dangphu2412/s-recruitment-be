import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components';
import { ActivityRequest } from '../../system/database/entities/activity-request.entity';
import { format } from 'date-fns';

type AssignedRequestEmailProps = {
  request: ActivityRequest;
};

export function AssignedRequestEmailTemplate({
  request,
}: Readonly<AssignedRequestEmailProps>) {
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
            Xin chào,
          </Heading>

          <Text style={{ marginBottom: '16px', color: '#374151' }}>
            Một yêu cầu hoạt động mới đã được{' '}
            <strong>{request?.author?.fullName}</strong> gửi lên và đã được giao
            cho bạn xử lý.
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
              Loại yêu cầu: {request.requestType}
            </Text>
            <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
              Ca đăng ký: {request.timeOfDay.fromTime} -{' '}
              {request.timeOfDay.toTime}
            </Text>
            {request.dayOfWeekId && (
              <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
                Ngày trong tuần: {request.dayOfWeek.name}
              </Text>
            )}
            {request.requestChangeDay && (
              <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
                Ngày thay đổi:{' '}
                {format(new Date(request.requestChangeDay), 'yyyy-MM-dd')}
              </Text>
            )}
            {request.compensatoryDay && (
              <Text style={{ fontWeight: 'bold', color: '#1e40af' }}>
                Ngày bù:{' '}
                {format(new Date(request.compensatoryDay), 'yyyy-MM-dd')}
              </Text>
            )}
            {request.reason && (
              <Text style={{ marginTop: '8px' }}>
                <strong>Lý do:</strong> {request.reason}
              </Text>
            )}

            <p>
              Bạn có thể kiểm tra yêu cầu {' '}
              <Link
                href={`https://mnm.sgroupvn.org/activities/requests?id=REQ-${request.id}`}
              >
                ngay đây
              </Link>
              {' '} hoặc tự mình đến trang web
            </p>
          </Section>

          <Text style={{ marginBottom: '16px', color: '#374151' }}>
            Vui lòng truy cập hệ thống để xác nhận và thực hiện các bước xử lý
            cần thiết.
          </Text>

          <Text style={{ color: '#374151' }}>
            Cảm ơn bạn đã phối hợp để đảm bảo hoạt động của tổ chức diễn ra
            thuận lợi.
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
