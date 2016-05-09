
import csv
import datetime
import json
import numpy as np



def read_csv(filename):
	data = [] 
	with open(filename + '.csv', 'rb') as csvfile:
		r = csv.reader(csvfile, delimiter=' ', quotechar='|')
		next(r)
		for row in r:
			entry = ' '.join(row).split(',')
			converted_date = convert_date(entry[3])
			datetimearr = [	converted_date.weekday(),
							converted_date.month,
							converted_date.day,
							converted_date.year,
							converted_date.hour]
			data.append([entry[2]] + datetimearr + entry[4:-1])
			# entry[3] = convert_date(entry[3]).date()
			# data.append(entry[2:])
	return np.array(data)

def convert_date(str):
	# print str[:-6]
	return datetime.datetime.strptime(str[:-15], "%a %b %d %Y %H:%M:%S")

def seave(data, action):
	ind = np.where(data[:,0] != action)[0]
	return np.delete(data, ind, axis=0)

def condense(data):
	circ = data[0][:-1]
	score_sum = int(data[0][-1])
	new_data = []
	for d in data:
		if np.all(d[:-1] == circ):
			score_sum += int(d[-1])
		else:
			new_data.append(circ.tolist() + [score_sum])
			score_sum = int(d[-1])
		circ = d[:-1]
	return np.array(new_data)

def save_csv(filename, data):
	with open(filename + '.csv', 'w') as csvfile:
		writer = csv.writer(csvfile)
		writer.writerow(['action','weekday','month','day','year','hour','score'])
		# writer.writerow(['action','date','score','running_total'])
		# writer.writerow(['user_id','user_name','action','date','score','running_total'])
		for i in range(data.shape[0]):
			writer.writerow(data[i])



data = read_csv('original')

data = condense(data)
data = seave(data, 'get_asset_comment')

save_csv('get_asset_comment', data)
