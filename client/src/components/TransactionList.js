import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles({
  root: {
    width: "100%",
    margin: 5
  },
  tableWrapper: {
    maxHeight: 400,
    overflow: "auto"
  }
});

const columns = [
  {
    id: "srcAcc",
    label: "From",
    minWidth: 50,
    maxWidth: 200,
    format: value => (value.length > 20 ? value.slice(0, 10) + "..." : value)
  },
  {
    id: "tgtAcc",
    label: "To",
    minWidth: 50,
    maxWidth: 200,
    format: value =>
      value && value.length > 20 ? value.slice(0, 10) + "..." : value
  },
  {
    id: "amount",
    label: "Amount",
    minWidth: 50,
    align: "right",
    format: value => (value ? value.toLocaleString() : 0)
  },
  {
    id: "type",
    label: "Type",
    minWidth: 50,
    align: "right",
    format: value => (value.length > 20 ? value.slice(0, 10) + "..." : value)
  }
];

const TransactionList = ({ transactions, myKey }) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper className={classes.root} elevation={3}>
      <div className={classes.tableWrapper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              ? transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, i) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                        {columns.map(column => {
                          const value = row[column.id];
                          if (column.id === "amount") {
                            if (row.srcAcc === myKey) {
                              return (
                                <TableCell
                                  key={column.id}
                                  align={column.align}
                                  style={{ color: "red" }}
                                >
                                  {column.format
                                    ? "-" + column.format(value)
                                    : "-" + value}
                                </TableCell>
                              );
                            } else {
                              return (
                                <TableCell
                                  key={column.id}
                                  align={column.align}
                                  style={{ color: "green" }}
                                >
                                  {column.format
                                    ? "+" + column.format(value)
                                    : "+" + value}
                                </TableCell>
                              );
                            }
                          } else {
                            return (
                              <Tooltip
                                id={column.id}
                                title={value}
                                key={column.id}
                              >
                                <TableCell key={column.id} align={column.align}>
                                  {column.format ? column.format(value) : value}
                                </TableCell>
                              </Tooltip>
                            );
                          }
                        })}
                      </TableRow>
                    );
                  })
              : null}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={(transactions && transactions.length) || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          "aria-label": "previous page"
        }}
        nextIconButtonProps={{
          "aria-label": "next page"
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TransactionList;
