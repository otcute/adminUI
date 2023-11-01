import idolAvatar from '@/../public/images/idol-avatar.png';
import banner from '@/../public/images/openVoteBanner.png';
import { VOTE_TYPE } from '@/constants/voteType';
import { deleteVote, getVote } from '@/services/management/vote';
import { FormatBirthday } from '@/utils/datetime';
import { DeleteOutlined, ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Drawer, Image, Modal, Popover, Table, Tag, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { configColumns } from './columns';

interface DataRequestOpenVoteTableProps {
  curRequestOpenVote?: API.VoteItem;
  setCurRequestOpenVote: React.Dispatch<React.SetStateAction<API.VoteItem | undefined>>;
  setShowModalForm: React.Dispatch<React.SetStateAction<boolean>>;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  showRejectModal: boolean;
  setShowRejectModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentStatus?: string;
  reload?: boolean;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataRequestOpenVoteTable: FC<DataRequestOpenVoteTableProps> = ({
  curRequestOpenVote,
  setCurRequestOpenVote,
  setShowModalForm,
  showDrawer,
  setShowDrawer,
  showRejectModal,
  setShowRejectModal,
  currentStatus,
  reload,
  setReload,
}) => {
  const { Title } = Typography;
  const intl = useIntl();

  const [requestVote, setRequestVote] = useState<API.VoteItem[]>([]);

  const handleReload = () => {
    setReload((pre) => !pre);
  };
  const { confirm } = Modal;
  const showDeleteConfirm = (id: number) => {
    confirm({
      title: `${intl.formatMessage({
        id: 'pages.vote.request.delete',
        defaultMessage: 'Delete this Request vote',
      })}`,
      icon: <ExclamationCircleFilled style={{ color: 'red' }} />,
      content: `${intl.formatMessage({
        id: 'pages.vote.request.deleteContent',
        defaultMessage: 'Do you really want to delete this item? This process can not be undone.',
      })}`,
      okText: `${intl.formatMessage({
        id: 'pages.button.delete',
        defaultMessage: 'Delete',
      })}`,
      okType: 'danger',
      cancelText: `${intl.formatMessage({
        id: 'pages.button.cancel',
        defaultMessage: 'Cancel',
      })}`,
      onOk: async () => {
        try {
          await deleteVote(id);
          handleReload();
          setShowDrawer(false);
        } catch (error) {
          console.error('Lỗi xóa idol:', error);
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleClickRow = (x: API.VoteItem) => {
    setCurRequestOpenVote(x);
    setShowDrawer(true);
  };

  const handleClickReject = () => {
    setShowRejectModal(true);
  };
  const handClickConfirmReject = () => {
    setShowRejectModal(false);
    setShowDrawer(false);
  };
  const handleOpenChange = (newOpen: boolean) => {
    setShowRejectModal(newOpen);
  };

  const handleGetRequestVote = async () => {
    const res = await getVote({ voteType: VOTE_TYPE.REQUEST_OPEN_TYPE });
    if (!currentStatus) {
      setRequestVote(res);
    } else {
      const newRes = res.filter((item) => item.status === currentStatus);
      if (newRes) {
        setRequestVote(newRes);
        return;
      }
    }
  };

  useEffect(() => {
    handleGetRequestVote();
  }, [curRequestOpenVote, currentStatus, reload]);

  return (
    <div className="wrapp-table">
      <Table
        columns={configColumns(showDeleteConfirm, setShowModalForm, setCurRequestOpenVote)}
        dataSource={requestVote}
        pagination={{
          showQuickJumper: true,
          defaultCurrent: 1,
          defaultPageSize: 10,
          total: requestVote.length,
        }}
        onRow={(record) => {
          return {
            onClick: () => handleClickRow(record),
          };
        }}
      />
      <Drawer
        placement="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        width={500}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="default"
              onClick={(e) => {
                e.stopPropagation();
                showDeleteConfirm(curRequestOpenVote?.voteId ?? -1);
              }}
            >
              <DeleteOutlined style={{ color: 'red' }} />
              <span style={{ color: 'red' }}>
                {intl.formatMessage({
                  id: 'pages.button.delete',
                  defaultMessage: 'Delete',
                })}
              </span>
            </Button>
            {curRequestOpenVote?.status === 'Waiting Approve' && (
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                }}
              >
                <Popover
                  trigger="click"
                  open={showRejectModal}
                  onOpenChange={handleOpenChange}
                  content={() => (
                    <div
                      style={{
                        width: '270px',
                        padding: '4px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                        }}
                      >
                        <InfoCircleOutlined style={{ color: '#FAAD14' }} />
                        <span>
                          {intl.formatMessage({
                            id: 'pages.vote.request.reject',
                            defaultMessage:
                              'Are you sure you want to reject this Open Vote Request ?',
                          })}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '8px',
                        }}
                      >
                        <Button onClick={() => setShowRejectModal(false)}>
                          {intl.formatMessage({
                            id: 'pages.button.reject.no',
                            defaultMessage: 'No',
                          })}
                        </Button>
                        <Button type="primary" onClick={() => handClickConfirmReject}>
                          {intl.formatMessage({
                            id: 'pages.button.reject.yes',
                            defaultMessage: 'Yes',
                          })}
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  <Button onClick={() => handleClickReject}>
                    {intl.formatMessage({
                      id: 'pages.button.reject',
                      defaultMessage: 'Reject',
                    })}
                  </Button>
                </Popover>
                <Button type="primary" onClick={() => setShowDrawer(false)}>
                  {intl.formatMessage({
                    id: 'pages.button.approve',
                    defaultMessage: 'Approve',
                  })}
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image src={banner} alt="Banner" width={200} height={200} />
        </div>
        <Title
          level={4}
          style={{ padding: '16px 0', borderBottom: '1px dash #E0E0E0', textAlign: 'center' }}
        >
          {curRequestOpenVote?.voteName}
        </Title>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '20px',
          }}
        >
          <div style={{ display: 'flex' }}>
            <div
              style={{
                width: '108px',
                fontSize: '14px',
                fontWeight: 400,
                color: '#616161',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {intl.formatMessage({
                id: 'pages.user.form.status',
                defaultMessage: 'Status',
              })}
            </div>
            <div
              style={{
                display: 'flex',
                fontWeight: 600,
                width: 'fit-content',
                padding: '8px 12px',
                borderRadius: '30px',
                color: `
                  ${curRequestOpenVote?.status === 'Approved' ? '#5DC983' : ''}
                  ${curRequestOpenVote?.status === 'Waiting Approve' ? '#E9B558' : ''}
                  ${curRequestOpenVote?.status === 'Rejected' ? '#848484' : ''}
                `,
                backgroundColor: `
                  ${curRequestOpenVote?.status === 'Approved' ? '#E7F7EC' : ''}
                  ${curRequestOpenVote?.status === 'Waiting Approve' ? '#FDF3E4' : ''}
                  ${curRequestOpenVote?.status === 'Rejected' ? '#F0F0F0' : ''}
                `,
                fontSize: '13px',
              }}
            >
              {curRequestOpenVote?.status}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '108px', fontSize: '14px', fontWeight: 400, color: '#616161' }}>
              {intl.formatMessage({
                id: 'pages.vote.fundingVote.form.idolVote',
                defaultMessage: 'Idol vote',
              })}
            </div>
            <div>
              <Tag
                style={{
                  fontSize: '13px',
                  display: 'flex',
                  gap: '4px',
                  padding: '4px 8px',
                }}
              >
                <img
                  src={idolAvatar}
                  alt="idolAvatar"
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                />
                <span>
                  community
                  {/* {curRequestOpenVote?.community} */}
                </span>
              </Tag>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '108px', fontSize: '14px', fontWeight: 400, color: '#616161' }}>
              {intl.formatMessage({
                id: 'pages.table.columns.requestDate',
                defaultMessage: 'RequestDate',
              })}
            </div>
            <div>{FormatBirthday(curRequestOpenVote?.requsetDate ?? '')}</div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '108px', fontSize: '14px', fontWeight: 400, color: '#616161' }}>
              {intl.formatMessage({
                id: 'pages.vote.topicVote.form.content',
                defaultMessage: 'Content',
              })}
            </div>
            <div style={{ maxWidth: '332px' }}>{curRequestOpenVote?.voteContent}</div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default DataRequestOpenVoteTable;

// const topicVoteData: API.RequestOpenVoteItem[] = [
//   {
//     voteTitle: 'SEOL MUSIC AWARDS x FANDOM',
//     requestDate: '2023-02-02T21:03:16.044967+07:00',
//     community: 'Lisa',
//     status: 'Approved',
//     content: 'Content SEOL MUSIC AWARDS x FANDOM',
//   },
// ];
