import { FC, useState } from "react";
import {
  Box,
  Button,
  Modal,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { isBefore } from "date-fns";

import { roomsData } from "../../../redux/reducers/roomsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchBookingsByUser } from "../../../redux/actions/bookings";
import { setErrorMessage } from "../../../redux/reducers/errorMessage";
import { newDateGenerator, timeConverter } from "../../../utils/dateUtils";
import { IEvent } from "../../../utils/types";
import { deleteBooking, sendAuthorizedQuery } from "../../../graphqlHelper";

import SelectInput from "../../UIs/Select/SelectInput";
import DatePicker from "../../UIs/datePicker/DatePicker";

import styles from "./editBookingModal.module.css";

interface EditModalProps {
  position: { x: number; y: number };
  showEditBookingModal: boolean;
  selectedBooking: IEvent;
  repeatData: { name: string; id: string }[];
  setShowEditBookingModal: (value: boolean) => void;
  setSelectedBooking: (value: IEvent) => void;
}

const EditBookingModal: FC<EditModalProps> = ({
  position,
  showEditBookingModal,
  selectedBooking,
  repeatData,
  setShowEditBookingModal,
  setSelectedBooking,
}) => {
  const {
    modal, box, typography, backdrop, datePickerWrapper, buttonWrapper,
    textField, buttonContainer, deleteButton, spanError
  } = styles;
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.users);
  const rooms = useAppSelector(roomsData);

  const { title, start, end, resourceId } = selectedBooking;
  const getHours = (time: Date) => timeConverter(time.getHours());
  const getMinutes = (time: Date) => timeConverter(time.getMinutes());

  const [isDeletionConfirmed, setIsDeletionConfirmed] = useState(false);
  const [startTime, setStartTime] = useState(
    `${getHours(start)}:${getMinutes(start)}`
  );
  const [endTime, setEndTime] = useState(`${getHours(end)}:${getMinutes(end)}`);

  const boxPosition = {
    left: position.x > 70 ? "70%" : `${position.x}%`,
    top: position.y > 518 ? 518 : position.y > 18 ? position.y : 18,
  };

  const handleEditBooking = () => selectedBooking;

  const onDeleteEvent = async () => {
    try {
      if (selectedBooking.id) {
        const response = await sendAuthorizedQuery(
          deleteBooking(selectedBooking.id),
          currentUser.login.access_token
        );
        setShowEditBookingModal(false);
        dispatch(fetchBookingsByUser(currentUser.login.id));
        return response.data.data;
      }
    } catch (error) {
      dispatch(setErrorMessage(error));
    }
  };

  const isPastBooking = isBefore(newDateGenerator(start, startTime), new Date()) && isBefore(newDateGenerator(end, endTime), new Date());

  return (
    <div>
      <Modal
        open={showEditBookingModal}
        onClose={() => setShowEditBookingModal(false)}
        className={modal}
        slotProps={{ backdrop: { className: backdrop } }}
      >
        <Box className={box} sx={boxPosition}>
          <Typography variant="h3" className={typography}>
            Edit booking
          </Typography>

          <TextField
            label="label"
            className={textField}
            defaultValue={title}
            onChange={(event) =>
              setSelectedBooking({
                ...selectedBooking,
                title: event.target.value,
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />

          <Box>
            <Box className={datePickerWrapper}>
              <AccessTimeIcon />
              <DatePicker
                value={start}
                handleChange={(value) => value}
                startTime={startTime}
                endTime={endTime}
                startTimeOnChange={(event) => setStartTime(event.target.value)}
                endTimeOnChange={(event) => setEndTime(event.target.value)}
              />
            </Box>
            {isPastBooking && <Typography className={spanError} variant="body2">Booking for a past time slot is not allowed.</Typography>}
          </Box>
          <SelectInput
            handleChange={(event: SelectChangeEvent<any>) => {
              setSelectedBooking({
                ...selectedBooking,
                resourceId: event.target.value,
              });
            }}
            data={rooms}
            defaultValue={resourceId}
            value={resourceId}
            note="There are available rooms"
          />

          <SelectInput
            handleChange={(event) => event}
            data={repeatData}
            value={repeatData[0].id}
            note="Select repeat options"
          />

          <Box className={buttonContainer}>
            {isDeletionConfirmed && (
              <Button className={deleteButton} onClick={onDeleteEvent}>
                Confirm deletion
              </Button>
            )}

            {!isDeletionConfirmed && (
              <Button
                className={deleteButton}
                onClick={() => setIsDeletionConfirmed(true)}
              >
                Delete
              </Button>
            )}

            <Box className={buttonWrapper}>
              <Button onClick={() => setShowEditBookingModal(false)}>
                Cancel
              </Button>
              <Button 
                disabled={isPastBooking} 
                variant="contained" 
                onClick={handleEditBooking}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default EditBookingModal;
